import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { AssetType } from '../assets/enums/asset-type.enum';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const defaultAssets = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      type: AssetType.CRYPTO,
      providerId: 'bitcoin',
      currentPrice: 67850.5,
      change24h: 3.42,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      type: AssetType.CRYPTO,
      providerId: 'ethereum',
      currentPrice: 3480.2,
      change24h: -1.28,
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      type: AssetType.CRYPTO,
      providerId: 'solana',
      currentPrice: 182.4,
      change24h: 8.65,
    },
    {
      symbol: 'USD/EUR',
      name: 'Euro',
      type: AssetType.FIAT,
      providerId: 'eur',
      currentPrice: 0.924,
      change24h: 0.18,
    },
    {
      symbol: 'USD/UYU',
      name: 'Uruguayan Peso',
      type: AssetType.FIAT,
      providerId: 'uyu',
      currentPrice: 41.85,
      change24h: -0.45,
    },
  ];

  const now = Date.now();
  const hourMs = 60 * 60 * 1000;

  for (const a of defaultAssets) {
    const asset = await prisma.asset.upsert({
      where: { symbol: a.symbol },
      update: a,
      create: a,
    });

    const existingPoints = await prisma.pricePoint.count({
      where: { assetId: asset.id },
    });

    if (existingPoints === 0) {
      const points: { assetId: string; price: number; timestamp: Date }[] = [];
      let price = a.currentPrice * 0.97;

      // Точки за последние 7 дней (каждые 4 часа)
      for (let i = 42; i >= 1; i--) {
        const delta = (Math.random() - 0.48) * 0.015;
        price = Number((price * (1 + delta)).toFixed(4));
        points.push({
          assetId: asset.id,
          price,
          timestamp: new Date(now - i * 4 * hourMs),
        });
      }

      // Точки за последний час (каждые 5 минут), сходящиеся к текущей цене
      for (let i = 12; i >= 1; i--) {
        const delta = (Math.random() - 0.5) * 0.004;
        const pointPrice =
          i === 1
            ? a.currentPrice
            : Number((a.currentPrice * (1 + delta)).toFixed(4));
        points.push({
          assetId: asset.id,
          price: pointPrice,
          timestamp: new Date(now - i * 5 * 60 * 1000),
        });
      }

      await prisma.pricePoint.createMany({ data: points });
    }
  }
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
