from django.apps import AppConfig


class UsersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.users"
    verbose_name = "Users"

    def ready(self):
        # Ensure at least one User Administrator exists at startup
        from django.core.management import call_command

        # Prevent running during management commands like 'migrate' or 'makemigrations'
        import sys
        if "manage.py" in sys.argv and any(cmd in sys.argv for cmd in ["migrate", "makemigrations"]):
            return

        # Run ensure_admin with verbosity 0 for silent operation
        call_command("ensure_admin", verbosity=0)