const fs = require('fs');
const contents = fs.readFileSync('src/lib/pricingConfig.ts', 'utf8');
const match = contents.match(/const CURRENCY_NAMES:\s*Record<string,\s*string>\s*=\s*(\{[\s\S]*?\});/);
if (match) {
  let objStr = match[1].replace(/([A-Z]+):/g, '"$1":');
  let data = JSON.parse(objStr);
  
  let dartList = `import 'package:flutter_riverpod/flutter_riverpod.dart';

class Currency {
  final String code;
  final String symbol;
  final String label;
  final String flag;

  const Currency({
    required this.code,
    required this.symbol,
    required this.label,
    required this.flag,
  });
}

const List<Currency> supportedCurrencies = [
`;
  
  const symbols = {
        'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'DKK': 'kr.',
        'VND': '₫', 'AUD': 'A$', 'CAD': 'C$', 'AED': 'dh', 'SAR': 'SR',
        'JPY': '¥', 'KRW': '₩', 'CNY': '¥', 'SGD': 'S$', 'NZD': 'NZ$',
        'HKD': 'HK$', 'PHP': '₱', 'MYR': 'RM', 'PKR': 'Rs', 'EGP': 'E£',
        'ZAR': 'R'
  };

  const popular = ['USD', 'INR', 'EUR', 'GBP', 'CAD', 'JPY'];
  const others = Object.keys(data).filter(k => !popular.includes(k)).sort();
  
  for (let code of [...popular, ...others]) {
      let name = data[code].replace(/'/g, "\\'");
      let sym = symbols[code] || code;
      dartList += `  Currency(code: '${code}', symbol: r'${sym}', label: '${name}', flag: '🌍'),\n`;
  }
  dartList += `];

class CurrencyNotifier extends StateNotifier<Currency> {
  CurrencyNotifier() : super(supportedCurrencies[0]); // Default to USD

  void setCurrency(Currency currency) {
    state = currency;
  }
}

final currencyProvider = StateNotifierProvider<CurrencyNotifier, Currency>((ref) {
  return CurrencyNotifier();
});
`;
  
  fs.writeFileSync('mobile_app/lib/services/currency_provider.dart', dartList, 'utf8');
  console.log('Update successful!');
} else {
  console.log('regex failed');
}
