import subprocess
appicon_pathname = '{{ cookiecutter.appicon_pathname }}'
launchscreen_bg_pathname = '{{ cookiecutter.launchscreen_bg_pathname }}'
launchscreen_logo_pathname = '{{ cookiecutter.launchscreen_logo_pathname }}'
subprocess.run(["sh", "../utils/gen_key.sh"], capture_output=True)
subprocess.run(["sh", "../utils/gen_assets.sh", appicon_pathname, launchscreen_bg_pathname, launchscreen_logo_pathname], capture_output=True)