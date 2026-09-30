# authentication.py
from rest_framework.authentication import TokenAuthentication


class CookieTokenAuthentication(TokenAuthentication):
    """
    Extends TokenAuthentication to extract the token from an HttpOnly cookie.
    Falls back to standard Authorization header if cookie is not set.
    """
    def authenticate(self, request):
        # Check for cookie first
        token_key = request.COOKIES.get("auth_token")
        
        if token_key:
            return self.authenticate_credentials(token_key)
        
        # Fall back to standard 'Authorization: Token <key>' header
        return super().authenticate(request)