import os
import uuid
import cloudinary
import cloudinary.uploader
from django.core.exceptions import ValidationError
from pathlib import Path
from decouple import Config, RepositoryEnv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / '.env'

config = Config(RepositoryEnv(str(ENV_PATH)))

cloudinary.config(
    cloud_name=config('CLOUDINARY_CLOUD_NAME'),
    api_key=config('CLOUDINARY_API_KEY'),
    api_secret=config('CLOUDINARY_API_SECRET'),
    secure=True
)

class CloudinaryService:

    @staticmethod
    def upload_image(image_file, folder="products"):
        if not image_file:
            return None
        try:
            upload_result = cloudinary.uploader.upload(
                image_file,
                folder=folder
            )
            return upload_result.get("secure_url")
        except Exception as e:
            err_msg = str(e).lower()
            if any(term in err_msg for term in ["limit", "quota", "exceeded", "free", "tier"]):
                raise ValidationError(
                    "Cloudinary upload failed: Your free tier storage/quota limit has been exceeded. Please upgrade your plan or clear space."
                )
            raise ValidationError(f"Cloudinary image upload failed: {str(e)}")
