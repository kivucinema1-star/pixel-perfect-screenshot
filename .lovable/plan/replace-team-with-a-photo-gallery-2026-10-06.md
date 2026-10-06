# Replace Team with a Photo Gallery

## What will change
- Replace the public Team section with a responsive Gallery showing photos only.
- Replace the Team admin tab with a Gallery tab where admins can upload, reorder, save, and delete photos.
- Keep using the existing secure Cloudinary upload endpoint and image validation.
- Change Team navigation links to Gallery so visitors reach the new section.

## Data
- Add a `gallery_items` table for image URL and display order, with public read access and admin-only editing.
- Copy existing team photos into the gallery so current images are not lost.
- Retire the old team content from the website without deleting its table or data.

## Technical details
- Update the shared public content fetch to return gallery items.
- Update public and admin screens to use `gallery_items`.
- Preserve drag-to-reorder behavior and Cloudinary uploads.
- Verify the public gallery and authenticated admin gallery workflow.
