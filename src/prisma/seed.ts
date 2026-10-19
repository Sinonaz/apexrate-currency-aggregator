import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const defaultAssets = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      providerId: 'bitcoin',
      currentPrice: 67850.5,
      change24h: 3.42,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      providerId: 'ethereum',
      currentPrice: 3480.2,
      change24h: -1.28,
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      providerId: 'solana',
      currentPrice: 182.4,
      change24h: 8.65,
    },
    {
      symbol: 'USD/EUR',
      name: 'Euro',
      providerId: 'eur',
      currentPrice: 0.924,
      change24h: 0.18,
    },
    {
      symbol: 'USD/UYU',
      name: 'Uruguayan Peso',
      providerId: 'uyu',
      currentPrice: 41.85,
      change24h: -0.45,
    },
  ];

  for (const a of defaultAssets) {
    await prisma.asset.upsert({
      where: { symbol: a.symbol },
      update: a,
      create: a,
    });
  }
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
