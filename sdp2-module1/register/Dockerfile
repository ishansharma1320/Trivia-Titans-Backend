FROM python:3.9-slim-buster

WORKDIR /register

COPY . /register

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

ENV FLASK_APP register.py

CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]


