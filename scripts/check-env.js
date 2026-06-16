// Quick diagnostic to check Stripe Price ID environment variables
const currencies = ['AED', 'PKR', 'USD'];
const plans = ['STARTER', 'GROWTH'];
const periods = ['', '_ANNUAL'];

console.log('=== STRIPE PRICE ID ENVIRONMENT VARIABLES ===\n');

let allValid = true;

currencies.forEach(currency => {
    console.log(`${currency}:`);
    plans.forEach(plan => {
        periods.forEach(period => {
            const envKey = `STRIPE_PRICE_${currency}_${plan}${period}`;
            const value = process.env[envKey];
            const isValid = value && value.startsWith('price_');
            const status = isValid ? '✅' : '❌';

            console.log(`  ${status} ${envKey}: ${value || '(not set)'}`);

            if (!isValid) allValid = false;
        });
    });
    console.log('');
});

if (!allValid) {
    console.log('⚠️  Some price IDs are missing or invalid!');
    console.log('\nExpected format: price_xxxxxxxxxxxxxxxxxxxxx');
    console.log('\nTo fix: Update your .env.local file with valid Stripe Price IDs from your Stripe Dashboard');
    process.exit(1);
} else {
    console.log('✅ All price IDs are configured correctly!');
    process.exit(0);
}
