from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.db import connection


class RootStatusView(APIView):
    """
    Lightweight, public API health check endpoint.
    Verifies that the server is alive and tests connection viability to PostgreSQL.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        db_connected = False
        db_error = None

        try:
            # Check the DB connection health directly
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                row = cursor.fetchone()
                if row:
                    db_connected = True
        except Exception as e:
            db_error = str(e)

        payload = {
            "status": "success",
            "message": "Superlaps API is running.",
            "database_connected": db_connected
        }

        if db_error:
            payload["database_error"] = db_error

        # StandardJSONRenderer will auto-wrap this payload into a standardised success envelope
        return Response(payload)
