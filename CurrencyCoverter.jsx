import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRightLeft, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Extended exchange rates
  const exchangeRates = {
    USD: { EUR: 0.92, GBP: 0.79, JPY: 150.35, AUD: 1.52, CAD: 1.35, CNY: 7.23, INR: 82.95, BRL: 4.97, MXN: 16.75, SGD: 1.34, CHF: 0.88, NZD: 1.64 },
    EUR: { USD: 1.09, GBP: 0.86, JPY: 163.42, AUD: 1.65, CAD: 1.47, CNY: 7.86, INR: 90.16, BRL: 5.40, MXN: 18.21, SGD: 1.46, CHF: 0.96, NZD: 1.78 },
    GBP: { USD: 1.27, EUR: 1.16, JPY: 190.02, AUD: 1.92, CAD: 1.71, CNY: 9.14, INR: 104.84, BRL: 6.28, MXN: 21.17, SGD: 1.70, CHF: 1.12, NZD: 2.07 },
    JPY: { USD: 0.0067, EUR: 0.0061, GBP: 0.0053, AUD: 0.010, CAD: 0.0090, CNY: 0.048, INR: 0.55, BRL: 0.033, MXN: 0.11, SGD: 0.0089, CHF: 0.0059, NZD: 0.011 },
    CNY: { USD: 0.14, EUR: 0.13, GBP: 0.11, JPY: 20.79, AUD: 0.21, CAD: 0.19, INR: 11.47, BRL: 0.69, MXN: 2.32, SGD: 0.19, CHF: 0.12, NZD: 0.23 },
    INR: { USD: 0.012, EUR: 0.011, GBP: 0.0095, JPY: 1.81, AUD: 0.018, CAD: 0.016, CNY: 0.087, BRL: 0.060, MXN: 0.20, SGD: 0.016, CHF: 0.011, NZD: 0.020 },
    AUD: { USD: 0.66, EUR: 0.61, GBP: 0.52, JPY: 99.48, CAD: 0.89, CNY: 4.76, INR: 54.57, BRL: 3.27, MXN: 11.02, SGD: 0.88, CHF: 0.58, NZD: 1.08 },
    CAD: { USD: 0.74, EUR: 0.68, GBP: 0.58, JPY: 111.77, AUD: 1.12, CNY: 5.35, INR: 61.31, BRL: 3.68, MXN: 12.38, SGD: 0.99, CHF: 0.65, NZD: 1.21 },
    BRL: { USD: 0.20, EUR: 0.19, GBP: 0.16, JPY: 30.37, AUD: 0.31, CAD: 0.27, CNY: 1.45, INR: 16.66, MXN: 3.37, SGD: 0.27, CHF: 0.18, NZD: 0.33 },
    MXN: { USD: 0.060, EUR: 0.055, GBP: 0.047, JPY: 9.01, AUD: 0.091, CAD: 0.081, CNY: 0.43, INR: 4.95, BRL: 0.30, SGD: 0.080, CHF: 0.053, NZD: 0.098 },
    SGD: { USD: 0.75, EUR: 0.69, GBP: 0.59, JPY: 112.89, AUD: 1.13, CAD: 1.01, CNY: 5.40, INR: 61.91, BRL: 3.71, MXN: 12.50, CHF: 0.66, NZD: 1.22 },
    CHF: { USD: 1.14, EUR: 1.04, GBP: 0.90, JPY: 171.04, AUD: 1.72, CAD: 1.53, CNY: 8.18, INR: 93.80, BRL: 5.62, MXN: 18.93, SGD: 1.52, NZD: 1.85 },
    NZD: { USD: 0.61, EUR: 0.56, GBP: 0.48, JPY: 92.45, AUD: 0.93, CAD: 0.83, CNY: 4.42, INR: 50.70, BRL: 3.04, MXN: 10.24, SGD: 0.82, CHF: 0.54 }
  };

  // Generate mock historical data for the chart
  const generateHistoricalData = () => {
    const data = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const baseRate = exchangeRates[fromCurrency][toCurrency];
      const randomVariation = (Math.random() - 0.5) * 0.1; // +/- 5% variation
      data.push({
        date: date.toISOString().split('T')[0],
        rate: (baseRate * (1 + randomVariation)).toFixed(4)
      });
    }
    return data;
  };

  const [historicalData, setHistoricalData] = useState([]);

  useEffect(() => {
    setHistoricalData(generateHistoricalData());
  }, [fromCurrency, toCurrency]);

  const currencies = Object.keys(exchangeRates);

  const convertCurrency = () => {
    if (!amount || !fromCurrency || !toCurrency) return 0;
    const rate = exchangeRates[fromCurrency][toCurrency];
    return (parseFloat(amount) * rate).toFixed(2);
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const getCurrencyName = (code) => {
    const names = {
      USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound',
      JPY: 'Japanese Yen', AUD: 'Australian Dollar',
      CAD: 'Canadian Dollar', CNY: 'Chinese Yuan',
      INR: 'Indian Rupee', BRL: 'Brazilian Real',
      MXN: 'Mexican Peso', SGD: 'Singapore Dollar',
      CHF: 'Swiss Franc', NZD: 'New Zealand Dollar'
    };
    return names[code] || code;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-800">
            Currency Converter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>
                        {currency} - {getCurrencyName(currency)}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={swapCurrencies}
                  className="mt-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                </button>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full p-2 border rounded-md bg-white"
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>
                        {currency} - {getCurrencyName(currency)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full"
                      max={new Date().toISOString().split('T')[0]}
                    />
                    <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-gray-600">
                    {amount} {fromCurrency} =
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {convertCurrency()} {toCurrency}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    1 {fromCurrency} = {exchangeRates[fromCurrency][toCurrency]} {toCurrency}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-64 md:h-full">
              <h3 className="text-sm font-medium text-gray-700 mb-4">30-Day Rate History</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData}>
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => date.slice(5)}
                    stroke="#6b7280"
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    stroke="#6b7280"
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyConverter;
