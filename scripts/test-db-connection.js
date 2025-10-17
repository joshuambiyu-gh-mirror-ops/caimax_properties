// Simple DB connectivity test using Prisma Client
// Run with DATABASE_URL set in environment, e.g.:
// $env:DATABASE_URL='postgres://user:pass@host:5432/db'; node scripts/test-db-connection.js

const { PrismaClient } = require('@prisma/client');

const client = new PrismaClient();

async function main(){
  try{
    console.log('Connecting to database...');
    await client.$connect();
    // run a simple query
    const result = await client.$queryRaw`SELECT 1 as result`;
    console.log('Connection OK — query result:', result);
    process.exitCode = 0;
  }catch(err){
    console.error('Database connection failed:', err);
    process.exitCode = 1;
  }finally{
    try{ await client.$disconnect(); }catch(e){}
  }
}

main();
