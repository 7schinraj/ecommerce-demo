from rest_framework.renderers import JSONRenderer


class StandardJSONRenderer(JSONRenderer):
    """
    Custom DRF JSON Renderer that automatically wraps all successful 2xx responses
    in a unified envelope:
    {
        "success": true,
        "message": "...",
        "data": { ... },
        "errors": null
    }
    """
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None

        # If it's an error response (status code >= 400), it is formatted by the custom exception handler.
        if response and response.status_code >= 400:
            if isinstance(data, dict) and 'success' in data:
                return super().render(data, accepted_media_type, renderer_context)
            
            # Fallback wrapper if something bypassed the exception handler
            fallback_errors = data
            message = "An error occurred."
            if isinstance(data, dict) and 'detail' in data:
                message = data.get('detail')
                fallback_errors = {"detail": [message]}

            formatted_error = {
                "success": False,
                "message": message,
                "data": None,
                "errors": fallback_errors
            }
            return super().render(formatted_error, accepted_media_type, renderer_context)

        # Default success message
        message = "Operation completed successfully."
        
        # If the view returns a custom message, extract it from response data
        if isinstance(data, dict) and 'message' in data:
            message = data.pop('message')

        formatted_data = {
            "success": True,
            "message": message,
            "data": data,
            "errors": None
        }

        return super().render(formatted_data, accepted_media_type, renderer_context)
