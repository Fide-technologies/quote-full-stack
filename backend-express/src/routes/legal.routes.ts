import { Router } from "express";

const router = Router();

// Professional Tailwind Layout Template
const wrapInTailwindLayout = (title: string, content: string, tableOfContents: string) => `
<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Merchant Quote Official</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .prose h3 { margin-top: 2rem; margin-bottom: 0.75rem; font-weight: 700; color: #111827; font-size: 1.25rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
        .prose p { margin-bottom: 1.25rem; color: #4b5563; line-height: 1.75; }
        .prose ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; color: #4b5563; }
        .prose li { margin-bottom: 0.5rem; }
        .prose strong { color: #111827; }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 antialiased">

    <!-- Header / Navigation -->
    <nav class="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16 items-center">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
                    <span class="font-bold text-lg tracking-tight">Merchant Quote</span>
                </div>
                <div class="hidden sm:flex gap-6 items-center text-sm font-medium text-slate-600">
                    <a href="/privacy" class="hover:text-emerald-600 transition-colors">Privacy</a>
                    <a href="/terms" class="hover:text-emerald-600 transition-colors">Terms</a>
                    <a href="mailto:fidetechonologies@gmail.com" class="px-4 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-all">Support</a>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div class="lg:flex lg:gap-16 items-start">
            
            <!-- Sidebar Navigation -->
            <aside class="hidden lg:block w-72 flex-shrink-0 sticky top-28">
                <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h5 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">On this page</h5>
                    <ul class="space-y-1">
                        ${tableOfContents}
                    </ul>
                    <div class="mt-8 pt-6 border-t border-slate-100">
                        <button onclick="window.print()" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            Print Document
                        </button>
                    </div>
                </div>
            </aside>

            <!-- Main Content Area -->
            <article class="flex-1 max-w-4xl bg-white rounded-3xl p-8 sm:p-12 lg:p-16 border border-slate-200 shadow-sm relative overflow-hidden">
                <!-- Achievement/Trust Badge -->
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6 ring-1 ring-emerald-200">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.908-3.333 9.277-8 10.157a41.341 41.341 0 01-1.045.16l-3-.5a10.72 10.72 0 01-4.945-2.06c-.77-.562-1.442-1.213-2.01-1.945a10.95 10.95 0 01-1.332-3.811 10.95 10.95 0 01-.166-2.001zm10.707 3.707a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    Compliance Official Document
                </div>

                <h1 class="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">${title}</h1>
                
                <div class="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-medium text-slate-500 mb-12">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Last Modified: April 12, 2026
                    </div>
                </div>

                <div class="prose prose-slate max-w-none">
                    ${content}
                </div>

                <!-- Footer Summary -->
                <div class="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div class="text-sm text-slate-400 font-medium">
                        &copy; 2026 Fide Technologies. All rights reserved.
                    </div>
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622l-.382-3.016z"></path></svg>
                        </div>
                        <div class="text-xs text-slate-500 font-bold leading-none tracking-tight text-left">
                            SECURE SSL<br/>ENCRYPTED DATA
                        </div>
                    </div>
                </div>
            </article>
        </div>
    </main>

    <footer class="bg-white border-t border-slate-200 py-12 mt-auto">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-sm text-slate-500 font-medium mb-4">Official legal documentation for the Merchant Quote application.</p>
            <div class="flex justify-center gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <a href="/privacy" class="hover:text-emerald-600 transition-colors">Privacy Policy</a>
                <a href="/terms" class="hover:text-emerald-600 transition-colors">Terms of Service</a>
                <a href="mailto:fidetechonologies@gmail.com" class="hover:text-emerald-600 transition-colors">Contact Support</a>
            </div>
        </div>
    </footer>

</body>
</html>
`;

// Public Privacy Policy route
router.get("/privacy", (req, res) => {
    const tableOfContents = `
        <li><a href="#intro" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">Introduction</a></li>
        <li><a href="#collection" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">1. Data Collection</a></li>
        <li><a href="#usage" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">2. How We Use Data</a></li>
        <li><a href="#sharing" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">3. Third Party Disclosure</a></li>
        <li><a href="#retention" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">4. Retention & Deletion</a></li>
        <li><a href="#rights" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">5. Your Legal Rights</a></li>
        <li><a href="#ccpa" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">6. CCPA & CPRA</a></li>
        <li><a href="#contact" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">7. Contact Information</a></li>
    `;

    const content = `
        <p id="intro" class="text-lg font-medium text-slate-900 mb-8">This Privacy Policy describes how your personal information is collected, used, and shared when you install or use the <strong>Merchant Quote</strong> App (the "App") on your Shopify store.</p>
        
        <h3 id="collection">1. Personal Information the App Collects</h3>
        <p>When you install the App, we are automatically able to access certain types of information from your Shopify account:</p>
        <ul>
            <li><strong>Merchant Information:</strong> We access your shop domain, primary administrative email address, and store owner details to facilitate secure account setup and ongoing merchant support.</li>
            <li><strong>Customer Information:</strong> For every quote request submitted through the App, we collect the customer's Name, Email Address, and any optional contact details (such as phone number) provided by the customer.</li>
            <li><strong>Quote Data:</strong> We securely store the content of individual quote requests, including product selections, pricing agreements, custom messages, and any files or images attached by customers.</li>
            <li><strong>Store Data:</strong> We access product listings and current inventory pricing to ensure generated quotes and Draft Orders are accurate and synchronized with your store.</li>
        </ul>

        <h3 id="usage">2. How Do We Use Your Personal Information?</h3>
        <p>We use the personal information collected to provide the core service and to operate the App, including:</p>
        <ul>
            <li>Enabling customers to request price quotes for specific products on your storefront.</li>
            <li>Allowing merchants to review, manage, and approve customer quote requests within the App dashboard.</li>
            <li>Automating the creation of Draft Orders in your Shopify Admin once a quote is approved.</li>
            <li>Sending automated email communications regarding quote status updates and confirmations.</li>
        </ul>

        <h3 id="sharing">3. Sharing Your Personal Information</h3>
        <p>We share critical information with established service providers only to the extent necessary to provide the App's functionality:</p>
        <ul>
            <li><strong>Shopify:</strong> As the primary platform host, data is synchronized with Shopify to manage Draft Orders and App billing. You can review Shopify's privacy practices at their official site.</li>
            <li><strong>Secure Infrastructure Providers:</strong> We utilize industry-standard, secure cloud database and media storage providers to host quote data and customer attachments. These providers maintain high-level security certifications.</li>
        </ul>
        <p>We do <strong>NOT</strong> sell your data, your customers' data, or any store information to third-party advertising networks or data brokers.</p>

        <h3 id="retention">4. Data Retention & Mandatory Deletion</h3>
        <p>Upon uninstallation of the App, your store information is maintained for a <strong>48-hour grace period</strong> to prevent data loss in case of accidental removal.</p>
        <p><strong>Deletion Protocols:</strong> Following this window, we honor Shopify's mandatory data redaction and deletion requests. We proceed with permanent removal of all associated store and customer records from our systems in accordance with platform requirements.</p>

        <h3 id="rights">5. Your Legal Rights (GDPR)</h3>
        <p>If you are a resident of the European Economic Area (EEA), you have the right to access the personal information we hold about you and to ask that it be corrected, updated, or deleted. Please reach out to our support team to exercise these rights.</p>

        <h3 id="ccpa">6. California Consumer Privacy Act (CCPA)</h3>
        <p>We are committed to the transparency of data usage. California residents have the right to request disclosure of what personal information is collected and to request its deletion. We do not engage in the "sale" of personal data.</p>

        <h3 id="contact">7. Contact Us</h3>
        <p>For inquiries regarding our privacy practices or to make a formal data request, please contact us at <strong>fidetechonologies@gmail.com</strong>.</p>
    `;
    res.send(wrapInTailwindLayout("Privacy Policy", content, tableOfContents));
});

// Public Terms of Service route
router.get("/terms", (req, res) => {
    const tableOfContents = `
        <li><a href="#acceptance" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">Introduction</a></li>
        <li><a href="#merchant" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">1. Merchant Duty</a></li>
        <li><a href="#billing" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">2. Fees & Billing</a></li>
        <li><a href="#intellectual" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">3. Intellectual Property</a></li>
        <li><a href="#liability" class="text-slate-600 hover:text-emerald-600 py-1 block transition-colors">4. Limitation of Liability</a></li>
    `;

    const content = `
        <p id="acceptance" class="text-lg font-medium text-slate-900 mb-8">By installing and using the Merchant Quote App, you agree to comply with the following Terms and Conditions.</p>

        <h3 id="merchant">1. Merchant Responsibility & Compliance</h3>
        <p>The merchant is solely responsible for ensuring that all quotes and negotiated pricing comply with their local business regulations. Additionally, per Shopify policy, all finalized transactions must be completed through the Shopify Checkout system.</p>

        <h3 id="billing">2. Fees and Billing</h3>
        <p>Subscription fees are managed and billed through the Shopify platform. Merchants are responsible for selecting the appropriate service tier for their business volume. Fee changes will be preceded by a 30-day notice.</p>

        <h3 id="intellectual">3. Intellectual Property</h3>
        <p>All software, branding, and proprietary systems within the App are the exclusive property of Fide Technologies. Unauthorized duplication or redistribution of the App's service is strictly prohibited.</p>

        <h3 id="liability">4. Limitation of Liability</h3>
        <p>The App is provided on an "AS IS" basis. Fide Technologies is not liable for indirect damages, lost profits, or business interruptions caused by external platform outages or third-party service failures.</p>
    `;
    res.send(wrapInTailwindLayout("Terms of Service", content, tableOfContents));
});

export default router;
