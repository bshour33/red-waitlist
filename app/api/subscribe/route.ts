// app/api/subscribe/route.ts
import { NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  console.log("API route called");
  
  try {
    // Parse request body
    const body = await req.json();
    console.log("Request body:", body);
    
    const { email, name, orderNumber, message, isWaitlist } = body;

    if (!email) {
      console.log("Email missing from request");
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    console.log("Processing email:", email);
    console.log("isWaitlist:", isWaitlist);

    if (isWaitlist) {
      // WAITLIST SUBMISSION - GOOGLE SHEETS INTEGRATION
      // Use the specific Google Sheet ID
      const SHEET_ID = process.env.GOOGLE_SHEET_ID;
      
      if (!SHEET_ID) {
        console.error("Google Sheet ID not found in environment variables");
        return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
      }
      
      console.log("Using sheet ID:", SHEET_ID);
      
      // Use individual environment variables for service account credentials
      const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
      const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
      
      if (!CLIENT_EMAIL || !PRIVATE_KEY) {
        console.error("Google service account credentials not found in environment variables");
        return NextResponse.json({ 
          message: "Server configuration error", 
          details: "Missing Google credentials" 
        }, { status: 500 });
      }
      
      let serviceAccountAuth;
      
      try {
        // Log the environment variable *before* using it
        console.log(`DEBUG: Raw GOOGLE_CLIENT_EMAIL: "${CLIENT_EMAIL}"`);
        console.log(`DEBUG: Raw GOOGLE_PRIVATE_KEY starts with: "${PRIVATE_KEY.substring(0, 30)}..."`);

        // Fix: Handle the private key properly - remove any extra quotes and handle newlines
        const formattedPrivateKey = PRIVATE_KEY
          .replace(/^"+|"+$/g, '') // Remove any extra quotes at start or end
          .replace(/\\n/g, '\n');   // Convert \n to actual newlines

        // Log the values being passed to JWT
        console.log(`DEBUG: Email for JWT: "${CLIENT_EMAIL}"`);
        console.log(`DEBUG: Formatted Private Key for JWT starts with: "${formattedPrivateKey.substring(0, 30)}..."`);

        // Create JWT auth with properly formatted private key
        serviceAccountAuth = new JWT({
          email: CLIENT_EMAIL,
          key: formattedPrivateKey,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        
        console.log("JWT auth created successfully with client email:", CLIENT_EMAIL);
      } catch (error) {
        console.error("Error creating JWT auth:", error);
        return NextResponse.json({ 
          message: "Server configuration error", 
          details: "Invalid credentials format" 
        }, { status: 500 });
      }
      
      // Connect to Google Sheets
      console.log("Connecting to Google Sheets...");
      const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
      
      // Load the document info
      console.log("Loading document info...");
      try {
        await doc.loadInfo();
        console.log("Document loaded, title:", doc.title);
      } catch (error) {
        console.error("Error loading Google Sheet:", error);
        return NextResponse.json({ 
          message: "Failed to access Google Sheet", 
          error: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
      }

      let sheet;
      try {
        // Try to get the first sheet
        sheet = doc.sheetsByIndex[0];
        if (!sheet) {
          // If no sheet exists, create one
          sheet = await doc.addSheet({ title: 'Waitlist Emails' });
        }
        console.log("Using sheet:", sheet.title);
      } catch (error) {
        console.error("Error getting/creating sheet:", error);
        return NextResponse.json({ 
          message: "Failed to access sheet", 
          error: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
      }
      
      // Check if headers exist and set them up if needed
      try {
        await sheet.loadHeaderRow();
        const headers = sheet.headerValues;
        
        if (!headers || headers.length === 0) {
          console.log("Setting up headers...");
          await sheet.setHeaderRow(['Email', 'Name', 'Date']);
        } else {
          console.log("Headers already exist:", headers);
        }
      } catch (error) {
        // This might happen if the sheet is completely empty
        console.log("Setting up headers for new sheet...");
        await sheet.setHeaderRow(['Email', 'Name', 'Date']);
      }
      
      // Add a row with the email and current date
      console.log("Adding row for email:", email);
      await sheet.addRow({ 
        Email: email, 
        Name: name || "From Waitlist Form", 
        Date: new Date().toISOString() 
      });
      console.log("Row added successfully");

      return NextResponse.json({ 
        message: "Email added to waitlist successfully" 
      }, { status: 200 });
    } else {
      // CONTACT FORM - EMAIL SENDING
      console.log("Processing contact form submission");
      
      // For contact support, ensure name and message are provided
      if (!name || !message) {
        console.log("Missing required fields for contact form");
        return NextResponse.json({ message: "Name and message are required" }, { status: 400 });
      }

      // Check for email environment variables
      if (!process.env.GOOGLE_EMAIL || !process.env.GOOGLE_APP_PASSWORD || !process.env.SUPPORT_EMAIL) {
        console.error("Missing email configuration in environment variables");
        return NextResponse.json({ 
          message: "Server configuration error", 
          details: "Email configuration missing" 
        }, { status: 500 });
      }

      console.log("Creating email transporter");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GOOGLE_EMAIL,
          pass: process.env.GOOGLE_APP_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.GOOGLE_EMAIL,
        to: process.env.SUPPORT_EMAIL,
        subject: `RED CUSTOMER SUPPORT - Issue from ${name}`,
        text: `
          Name: ${name}
          Email: ${email}
          Order Number: ${orderNumber || "N/A"}
          Message: ${message}
        `,
      };

      console.log("Sending email to:", process.env.SUPPORT_EMAIL);
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
      
      return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
    }
  } catch (error) {
    console.error("Request handling error:", error);
    return NextResponse.json({ 
      message: "Failed to process request", 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}