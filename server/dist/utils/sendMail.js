"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// async..await is not allowed in global scope, must use a wrapper
function sendMail({ to, subject, html }) {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        //   let testAccount = await nodemailer.createTestAccount();
        //   console.log(testAccount)
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer_1.default.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: 'rqtp3oo7mfapq6cr@ethereal.email',
                pass: 'xHfM8hBM3TxMP18CrX', // generated ethereal password
            },
        });
        // send mail with defined transport object
        let info = yield transporter.sendMail({
            from: 'reddit@gmail.com',
            to,
            subject,
            text: '',
            html, // html body
        });
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
}
exports.sendMail = sendMail;
