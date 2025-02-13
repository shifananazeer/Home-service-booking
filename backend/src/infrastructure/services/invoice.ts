import PDFDocument from "pdfkit";
import { Response } from "express";

export const generateInvoicePDF = async (booking: any, res: Response) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const filename = `invoice-${booking.BookingId}.pdf`;

      // Set response headers for PDF
      res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
      res.setHeader("Content-Type", "application/pdf");

      // Pipe the PDF document to the response stream
      doc.pipe(res);

      // **Invoice Header**
      doc.fontSize(20).text("Invoice", { align: "center" });
      doc.moveDown();

      // **Customer Details**
      doc.fontSize(12).text(`Customer: ${booking.userId.firstName}`);
      doc.text(`Email: ${booking.userId.email}`);
      // doc.text(`Phone: ${booking.phone || "N/A"}`);
      doc.moveDown();

      // **Service Details**
      doc.text(`Service: ${booking.serviceName}`);
      doc.text(`Worker: ${booking.workerName}`);
      doc.text(`Work Date: ${new Date(booking.date).toLocaleDateString()}`);
      doc.text(`Time Slot: ${booking.slotId}`);
      doc.text(`Work Description: ${booking.workDescription}`);
      doc.moveDown();

      // **Payment Details**
      doc.text(`Advance Paid: ₹${booking.advancePayment}`);
      doc.text(`Balance Paid: ₹${booking.balancePayment}`);
      doc.text(`Total Paid: ₹${booking.totalPayment}`);
      doc.text(`Payment Status: ${booking.paymentStatus}`);
      doc.text(`Work Status: ${booking.workStatus}`);
      doc.moveDown();

      // **Footer**
      doc.text("Thank you for using our service!", { align: "center" });

      // End document
      doc.end();
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
};
