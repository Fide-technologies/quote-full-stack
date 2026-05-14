import type { QuoteDocument } from "@/types";
import type { IEmailConfigData } from "./IEmailConfigData";

export interface IEmailService {
    sendQuoteNotification(shop: string, quote: QuoteDocument): Promise<void>;
    sendQuoteAcceptance(quote: QuoteDocument, price: number, quantity: number, message: string): Promise<void>;
    sendQuoteRejection(quote: QuoteDocument, message: string): Promise<void>;
    testSmtpConnection(publicSettings: Partial<IEmailConfigData>, privateSettings: Partial<IEmailConfigData>): Promise<boolean>;
}
