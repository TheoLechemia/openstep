# Openstep

Openstep is an opensource self-hosted travel book application.
It is a good opensource alternative of the wellknown PolarStep app.

Openstep is made of three main parts :

- a simple django-admin backoffice to create travels, steps, users and permissions
- an API provided by Django-Rest-Framework
- an Angular frontend to display travels and step is a public web page

## Functionalities

With open step you can create several travels and write your trip adventures into steps. Each step can contain pictures, description and a location. All travel and steps are published in a public web app where everybody can read your adventures ! No need to be connected to access to the website and all the trips. Everyone can write comments on steps without being connected.
On the backoffice side, the admin can create severals users and attached them to travels. The users can only see and modify their own trips.
The public web page is fully responsive and can be used is mobile terminals.

Public web app screenshots :

![Capture d’écran du 2025-06-21 13-08-20](https://github.com/user-attachments/assets/25b066c7-f17c-4bd8-9686-15b5cd71690b)
![Capture d’écran du 2025-06-21 13-08-54](https://github.com/user-attachments/assets/3b6fec04-2025-4806-aeef-435e0699f23a)
![Capture d’écran du 2025-06-21 13-09-49](https://github.com/user-attachments/assets/25fd51b8-78d1-4052-b050-3caad10684fc)

Backoffice screenshots :

![Capture d’écran du 2025-06-21 13-08-04](https://github.com/user-attachments/assets/7e58bf0a-de9b-4b47-ad40-aa53095b3f07)

## Deploy

Docker is use to deploy the application (dev or prod).
Copy and fill the .env.sample file

Build and run the with docker :

    docker compose up --build

Create a django superuser :

    docker compose run backend ./manage.py createsuperuser

That's it !

⚠️ the prod deployment has not been tested yet
