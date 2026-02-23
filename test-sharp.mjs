// Test script to verify sharp works correctly
import sharp from 'sharp';

async function testSharp() {
  console.log('Testing sharp installation...\n');

  try {
    // Test 1: Create a simple image
    console.log('Test 1: Creating test image...');
    const testImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .webp({ quality: 85 })
    .toBuffer();
    
    console.log('✅ Test 1 passed - Created', testImage.length, 'bytes\n');

    // Test 2: Get sharp version
    console.log('Test 2: Sharp version info...');
    const sharpInfo = sharp.versions;
    console.log('Sharp version:', sharpInfo);
    console.log('✅ Test 2 passed\n');

    console.log('🎉 All tests passed! Sharp is working correctly.');
    
  } catch (error) {
    console.error('❌ Sharp test failed:', error);
    process.exit(1);
  }
}

testSharp();
