FROM python:3.9-slim-buster

WORKDIR /login

COPY . /login

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5100

ENV FLASK_APP login.py

CMD ["flask", "run", "--host=0.0.0.0", "--port=5100"]


