// Quick script to check what loads exist in the database
const { MongoClient } = require('mongodb');

async function checkLoads() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/lodex');
  
  try {
    await client.connect();
    const db = client.db();
    
    // Check loads collection
    const loads = await db.collection('loads').find({}).toArray();
    console.log('Total loads in database:', loads.length);
    
    if (loads.length > 0) {
      console.log('\nAvailable load IDs:');
      loads.forEach((load, index) => {
        console.log(`${index + 1}. ${load._id} - Status: ${load.status} - Shipper: ${load.shipperId}`);
      });
      
      console.log('\nFirst load details:');
      console.log(JSON.stringify(loads[0], null, 2));
    } else {
      console.log('No loads found in database');
    }
    
    // Check users collection  
    const users = await db.collection('users').find({}).toArray();
    console.log('\nTotal users in database:', users.length);
    
    if (users.length > 0) {
      console.log('Users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user._id} - ${user.email} - Role: ${user.role}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await client.close();
  }
}

checkLoads();