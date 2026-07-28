export default function JsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Shivamrit Ayurveda",
    "url": "https://www.shivamritayurveda.in",
    "logo": "https://www.shivamritayurveda.in/assets/logo.png",
    "description": "Pure authentic Ayurvedic hair care oils, anti-dandruff shampoos, kumkumadi face serums, neem combs, and herbal soaps.",
    "telephone": "+91 8123403829",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://instagram.com/shivamrit_ayurveda_"
    ]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Shivamrit Ayurveda",
    "url": "https://www.shivamritayurveda.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.shivamritayurveda.in/products?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Shivamrit Ayurveda Store",
    "image": "https://www.shivamritayurveda.in/assets/combo pack.png",
    "url": "https://www.shivamritayurveda.in",
    "telephone": "+91 8123403829",
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, Credit Card, Razorpay, UPI",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
    </>
  );
}
