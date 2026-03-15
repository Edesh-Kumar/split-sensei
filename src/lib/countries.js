export const countries = [
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "EU", name: "European Union", currency: "EUR", symbol: "€" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥" },
  { code: "SG", name: "Singapore", currency: "SGD", symbol: "S$" },
  { code: "AE", name: "UAE", currency: "AED", symbol: "د.إ" },
  { code: "CH", name: "Switzerland", currency: "CHF", symbol: "Fr" },
  { code: "NZ", name: "New Zealand", currency: "NZD", symbol: "NZ$" },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R" },
  { code: "MX", name: "Mexico", currency: "MXN", symbol: "MX$" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$" },
  { code: "TH", name: "Thailand", currency: "THB", symbol: "฿" },
  { code: "ID", name: "Indonesia", currency: "IDR", symbol: "Rp" },
  { code: "MY", name: "Malaysia", currency: "MYR", symbol: "RM" },
  { code: "PH", name: "Philippines", currency: "PHP", symbol: "₱" },
  { code: "VN", name: "Vietnam", currency: "VND", symbol: "₫" },
  { code: "KR", name: "South Korea", currency: "KRW", symbol: "₩" },
  { code: "CN", name: "China", currency: "CNY", symbol: "¥" },
  { code: "HK", name: "Hong Kong", currency: "HKD", symbol: "HK$" },
  { code: "NO", name: "Norway", currency: "NOK", symbol: "kr" },
  { code: "SE", name: "Sweden", currency: "SEK", symbol: "kr" },
  { code: "DK", name: "Denmark", currency: "DKK", symbol: "kr" },
  { code: "PL", name: "Poland", currency: "PLN", symbol: "zł" },
  { code: "TR", name: "Turkey", currency: "TRY", symbol: "₺" },
  { code: "EG", name: "Egypt", currency: "EGP", symbol: "E£" },
  { code: "NG", name: "Nigeria", currency: "NGN", symbol: "₦" },
  { code: "KE", name: "Kenya", currency: "KES", symbol: "KSh" },
  { code: "AR", name: "Argentina", currency: "ARS", symbol: "ARS$" },
  { code: "CL", name: "Chile", currency: "CLP", symbol: "CLP$" },
  { code: "CO", name: "Colombia", currency: "COP", symbol: "COL$" },
  { code: "NP", name: "Nepal", currency: "NPR", symbol: "Rs" },
  { code: "LK", name: "Sri Lanka", currency: "LKR", symbol: "Rs" },
  { code: "PK", name: "Pakistan", currency: "PKR", symbol: "Rs" },
  { code: "BD", name: "Bangladesh", currency: "BDT", symbol: "৳" },
];

export const getCurrencyByCountry = (countryCode) => {
  const country = countries.find((c) => c.code === countryCode);
  return country
    ? { currency: country.currency, symbol: country.symbol }
    : { currency: "USD", symbol: "$" };
};

export const getCurrencyByLocation = (locationName) => {
  if (!locationName) return { currency: "USD", symbol: "$" };
  const lower = locationName.toLowerCase();
  const country = countries.find(
    (c) =>
      lower.includes(c.name.toLowerCase()) ||
      lower.includes(c.code.toLowerCase()),
  );
  return country
    ? { currency: country.currency, symbol: country.symbol }
    : { currency: "USD", symbol: "$" };
};
