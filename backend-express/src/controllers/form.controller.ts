import type { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { BaseController } from "./base.controller";
import { TYPES } from "@/types";
import type { IFormService } from "@/interfaces";
import { CONTROLLER } from "@/constants";

@injectable()
export class FormController extends BaseController {
    constructor(
        @inject(TYPES.IFormService) private formService: IFormService
    ) {
        super();
    }

    public getForm = async (req: Request, res: Response) => {
        try {
            const shop = (req.query.shop as string) || (res.locals.shopify?.session?.shop);

            if (!shop) {
                return this.handleError(res, new Error(CONTROLLER.MISSING_SHOP), CONTROLLER.MISSING_SHOP);
            }

            const form = await this.formService.getFormByShop(shop);

            // If no custom form is found, return a default template structure so the frontend can still render something
            if (!form) {
                return this.ok(res, {
                    shop,
                    title: "Request a Quote",
                    settings: {
                        submitButtonText: "Submit Quote",
                        successMessage: "Thank you for your request. Our team will review your quote and get back to you shortly."
                    },
                    steps: [
                        {
                            id: "step-contact",
                            title: "Contact",
                            isSystem: true,
                            fields: [
                                { id: "field-fname", type: "text", label: "First Name", required: true, isSystem: true, layoutWidth: "half" },
                                { id: "field-lname", type: "text", label: "Last Name", required: true, isSystem: true, layoutWidth: "half" },
                                { id: "field-email", type: "email", label: "Email Address", required: true, isSystem: true, layoutWidth: "full" },
                                { id: "field-phone", type: "phone", label: "Phone Number", required: true, isSystem: true, layoutWidth: "full" }
                            ]
                        },
                        {
                            id: "step-address",
                            title: "Address",
                            isSystem: true,
                            fields: [
                                { id: "field-address1", type: "text", label: "Address Line 1", required: true, isSystem: true, layoutWidth: "full" },
                                { id: "field-address2", type: "text", label: "Address Line 2", required: false, isSystem: true, layoutWidth: "full" },
                                { id: "field-city", type: "text", label: "City", required: true, isSystem: true, layoutWidth: "half" },
                                { id: "field-district", type: "text", label: "District", required: true, isSystem: true, layoutWidth: "half" },
                                { id: "field-state", type: "text", label: "State", required: true, isSystem: true, layoutWidth: "half" },
                                { id: "field-pincode", type: "text", label: "Pincode", required: true, isSystem: true, layoutWidth: "half" }
                            ]
                        },
                        {
                            id: "step-details",
                            title: "Details",
                            isSystem: true,
                            fields: [
                                { id: "field-message", type: "textarea", label: "Additional Message", required: false, isSystem: true }
                            ]
                        },
                        {
                            id: "step-review",
                            title: "Review",
                            isSystem: true,
                            fields: [] // Review step doesn't need explicit input fields, it just renders the summary
                        }
                    ]
                }, "Default form configuration returned");
            }

            return this.ok(res, form, "Form configuration retrieved successfully");
        } catch (error) {
            return this.handleError(res, error, "Failed to retrieve form configuration");
        }
    };

    public updateForm = async (req: Request, res: Response) => {
        try {
            const shop = res.locals.shopify?.session?.shop;

            if (!shop) {
                return this.handleError(res, new Error(CONTROLLER.MISSING_SHOP), CONTROLLER.MISSING_SHOP);
            }

            const formData = req.body;
            const updatedForm = await this.formService.saveForm(shop, formData);

            return this.ok(res, updatedForm, "Form configuration saved successfully");
        } catch (error) {
            return this.handleError(res, error, "Failed to save form configuration");
        }
    };
}
