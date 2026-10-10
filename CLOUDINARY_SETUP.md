# Cloudinary Setup Guide for Mobitech

This project uses Cloudinary for secure, scalable image storage. Images are uploaded to Cloudinary, and only the URLs and public IDs are stored in our MongoDB database. This guide explains how to set up Cloudinary for this project.

## 1. Create a Cloudinary Account
- Go to [Cloudinary](https://cloudinary.com/users/register/free) and sign up for a free account.
- Once registered, you will be redirected to the **Programmable Media Dashboard**.

## 2. Obtain Your Credentials
In your Cloudinary Dashboard, look for the **Product Environment Credentials** section. You will need three specific values:
- **Cloud Name**
- **API Key**
- **API Secret**

## 3. Update the Server Environment
Do **NOT** put these credentials in the frontend `.env` file (e.g. `VITE_...`). The frontend must never have access to the `API_SECRET`.
Instead, open the file `server/.env` and add the following variables:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

(Note: A placeholder for these has been added to `server/.env.example`.)

## 4. Restart the Backend
After modifying the `server/.env` file, stop your running backend server (e.g., using `Ctrl+C`) and start it again:
```bash
cd server
npm run dev
```

## 5. Test the Upload
1. Log in to the Mobitech admin panel (`http://localhost:5173/admin`).
2. Go to the **Products** section and click **Add Product** (or edit an existing one).
3. In the "Product Photos" section, upload or drag-and-drop a new image.
4. You should see an "Uploading..." state followed by the successful appearance of the image.
5. If you crop or edit the image in the editor, clicking "Save Changes" will automatically upload the newly cropped version to Cloudinary.
6. Click "Save Product". 

## 6. Verify MongoDB Storage
To confirm that Base64 blobs are no longer being stored:
1. Connect to your MongoDB instance (e.g. via MongoDB Compass).
2. Open the `mobitech` database and select the `products` collection.
3. Find the product you just updated.
4. Look at the `images` array. It should no longer contain massive strings starting with `data:image/...`. 
5. Instead, each entry in the `images` array will now look like this:
   ```json
   {
     "url": "https://res.cloudinary.com/.../mobitech/products/...",
     "publicId": "mobitech/products/..."
   }
   ```

*Note: Existing product images saved as raw strings are fully backward-compatible and will not break.*
