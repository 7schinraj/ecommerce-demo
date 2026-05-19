from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework.
    Intercepts any API exception and formats it in a unified structure:
    {
        "success": false,
        "message": "...",
        "data": null,
        "errors": { ... }
    }
    """
    # Call DRF's default exception handler first to get the standard response.
    response = exception_handler(exc, context)

    if response is not None:
        errors = response.data
        message = "Validation failed."

        # Process detail/errors dictionary to extract a readable main message
        if isinstance(errors, dict):
            # If standard 'detail' is present (e.g. AuthenticationFailed, PermissionDenied, NotFound)
            if 'detail' in errors:
                message = errors.get('detail')
                # If there are no other specific field errors, wrap the detail
                if len(errors) == 1:
                    errors = {"non_field_errors": [message]}
            # If validation error contains multiple fields, use the first field's error as the main message
            elif len(errors) > 0:
                first_field = list(errors.keys())[0]
                first_err = errors[first_field]
                if isinstance(first_err, list) and len(first_err) > 0:
                    # E.g. "Account already exists" or "This field is required."
                    message = first_err[0]
                elif isinstance(first_err, str):
                    message = first_err
        elif isinstance(errors, list):
            message = errors[0] if len(errors) > 0 else "Validation failed."
            errors = {"non_field_errors": errors}
        else:
            message = str(errors)
            errors = {"non_field_errors": [message]}

        # If message was formatted as a list, get the first item
        if isinstance(message, list) and len(message) > 0:
            message = message[0]

        # Standardize message to a string
        message = str(message)

        # Update the response body to match our consistent error envelope
        response.data = {
            "success": False,
            "message": message,
            "data": None,
            "errors": errors
        }
    else:
        # Handles unexpected server side exceptions (HTTP 500)
        # Keeps response output strictly formatted as JSON instead of raw HTML crash pages
        error_msg = str(exc)
        response = Response({
            "success": False,
            "message": "An unexpected server error occurred.",
            "data": None,
            "errors": {
                "server_error": [error_msg]
            }
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
