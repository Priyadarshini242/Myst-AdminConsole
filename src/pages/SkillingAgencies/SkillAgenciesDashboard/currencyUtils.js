const getCurrencySymbol = (currency) => {
    switch (currency) {
        case "USD":
            return "$";
        case "CAD":
            return "$";
        case "INR":
            return "₹";
        case "EUR":
            return "€";
        case "GBP":
            return "£";
        default:
            return currency; 
    }
};

export default getCurrencySymbol;
