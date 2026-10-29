FROM python:3.12-slim-bookworm
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY runner.py /runner/runner.py
USER 65534:65534
WORKDIR /tmp
ENTRYPOINT ["python", "-I", "-S", "/runner/runner.py"]
