import { Container } from "inversify";
import { TYPES } from "./types/types";
import { MerchantRepository } from "./repositorys/merchants";
import { QuoteRepository } from "./repositorys/quotes";
import { PlanRepository } from "@/repositorys/plans";
import { MerchantService } from "./services/merchant.service";
import { QuoteService } from "./services/quote.service";
import { PlanService } from "./services/plan.service";
import { EmailService } from "./services/email.service";
import { SettingsService } from "./services/settings.service";
import { DraftOrderService } from "./services/draft-order.service";
import { UsageService } from "./services/usage.service";
import { DraftOrderMapper } from "./mappers/draft-order.mapper";
import { WebhookRegistry } from "./services/webhook-registry.service";
import { AuthController } from "./controllers/auth.controller";
import { QuoteController } from "./controllers/quote.controller";
import { WebhooksController } from "./controllers/webhoook.controller";
import { MerchantController } from "./controllers/merchant.controller";
import { SettingsController } from "./controllers/settings.controller";
import { DraftOrderController } from "./controllers/draft-order.controller";
import { PlanController } from "./controllers/plan.controller";
import { FormRepository } from "./repositorys/forms";
import { FormService } from "./services/form.service";
import { FormController } from "./controllers/form.controller";
import { DashboardService } from "./services/dashboard.service";
import { DashboardController } from "./controllers/dashboard.controller";
import { UploadController } from "./controllers/upload.controller";
import type { IMerchantRepository, IQuoteRepository, IPlanRepository, IFormRepository } from "./interfaces";
import type { IMerchantService, IQuoteService, IPlanService, IEmailService, ISettingsService, IDraftOrderService, IWebhookRegistry, IUsageService, IFormService, IDashboardService } from "./interfaces";

const container = new Container();


container.bind<IMerchantRepository>(TYPES.IMerchantRepository).to(MerchantRepository).inSingletonScope();
container.bind<IQuoteRepository>(TYPES.IQuoteRepository).to(QuoteRepository).inSingletonScope();
container.bind<IPlanRepository>(TYPES.IPlanRepository).to(PlanRepository).inSingletonScope();

container.bind<IMerchantService>(TYPES.IMerchantService).to(MerchantService).inSingletonScope();
container.bind<IQuoteService>(TYPES.IQuoteService).to(QuoteService).inSingletonScope();
container.bind<IPlanService>(TYPES.IPlanService).to(PlanService).inSingletonScope();
container.bind<IEmailService>(TYPES.IEmailService).to(EmailService).inSingletonScope();
container.bind<ISettingsService>(TYPES.ISettingsService).to(SettingsService).inSingletonScope();
container.bind<IDraftOrderService>(TYPES.IDraftOrderService).to(DraftOrderService).inSingletonScope();
container.bind<IUsageService>(TYPES.IUsageService).to(UsageService).inSingletonScope();
container.bind<IWebhookRegistry>(TYPES.IWebhookRegistry).to(WebhookRegistry).inSingletonScope();
container.bind(TYPES.DraftOrderMapper).to(DraftOrderMapper).inSingletonScope();

container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();
container.bind<QuoteController>(TYPES.QuoteController).to(QuoteController).inSingletonScope();
container.bind<WebhooksController>(TYPES.WebhooksController).to(WebhooksController).inSingletonScope();
container.bind<MerchantController>(TYPES.MerchantController).to(MerchantController).inSingletonScope();
container.bind<SettingsController>(TYPES.SettingsController).to(SettingsController).inSingletonScope();
container.bind<DraftOrderController>(TYPES.DraftOrderController).to(DraftOrderController).inSingletonScope();
container.bind<PlanController>(TYPES.PlanController).to(PlanController).inSingletonScope();

container.bind<IFormRepository>(TYPES.IFormRepository).to(FormRepository).inSingletonScope();
container.bind<IFormService>(TYPES.IFormService).to(FormService).inSingletonScope();
container.bind<FormController>(TYPES.FormController).to(FormController).inSingletonScope();
container.bind<IDashboardService>(TYPES.IDashboardService).to(DashboardService).inSingletonScope();
container.bind<DashboardController>(TYPES.DashboardController).to(DashboardController).inSingletonScope();
container.bind<UploadController>(TYPES.UploadController).to(UploadController).inSingletonScope();

export { container };
