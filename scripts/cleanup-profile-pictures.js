const mongoose = require('mongoose');
require('dotenv').config();

async function cleanupProfilePictures() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define the Student schema inline for the script
    const studentSchema = new mongoose.Schema({
      userId: String,
      profilePictureUrl: String,
      // Add other fields as needed
    });

    const Student = mongoose.model('Student', studentSchema);

    // Find all students with invalid profile picture URLs
    const studentsWithInvalidPictures = await Student.find({
      $or: [
        { profilePictureUrl: { $regex: /undefined/ } },
        { profilePictureUrl: { $regex: /null/ } },
        { profilePictureUrl: '/avatar.png' },
        { profilePictureUrl: '' },
        { profilePictureUrl: { $exists: false } }
      ]
    });

    console.log(`Found ${studentsWithInvalidPictures.length} students with invalid profile pictures`);

    if (studentsWithInvalidPictures.length > 0) {
      // Update all invalid profile picture URLs to null
      const result = await Student.updateMany(
        {
          $or: [
            { profilePictureUrl: { $regex: /undefined/ } },
            { profilePictureUrl: { $regex: /null/ } },
            { profilePictureUrl: '/avatar.png' },
            { profilePictureUrl: '' },
            { profilePictureUrl: { $exists: false } }
          ]
        },
        { $set: { profilePictureUrl: null } }
      );

      console.log(`Updated ${result.modifiedCount} student records`);
      console.log('Profile picture cleanup completed successfully');
    } else {
      console.log('No invalid profile pictures found');
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupProfilePictures(); 