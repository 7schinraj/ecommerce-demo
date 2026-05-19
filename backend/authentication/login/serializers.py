from rest_framework import serializers


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField(
        required=True,
        help_text="Enter your registered email address (e.g. chinraj1438@gmail.com)"
    )
    password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'},
        help_text="Enter your secure password"
    )

    def validate_email(self, value):
        if value:
            return value.strip().lower()
        return value
