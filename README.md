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

## Developpemnt


Openstep frontend is a Angular app.
First install the app dependencies :

    cd frontend/openstep
    npm install

Launch the dev server :

    npm run start

#### Backend

The API and the backoffice are made with django. It uses GeoDjango, so a
PostGIS database is required.

Install the system dependencies first (Debian/Ubuntu): PostgreSQL + PostGIS
server-side, and GDAL/GEOS at runtime for GeoDjango:

    sudo apt install postgresql postgis gdal-bin libgdal-dev

Install backend dependencies:

    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt

Create the configuration from the sample and adjust it if needed (database
credentials, allowed hosts, ...):

    cp openstep/openstep/config.py.sample openstep/openstep/config.py

Create the PostGIS database, role and extension. The script reads the
credentials straight from your `config.py`, so the role always matches what the
app expects:

    sudo -u postgres ./scripts/create_db.sh

Apply migrations and create an admin user for the backoffice:

    cd openstep
    python manage.py migrate
    python manage.py createsuperuser

Run dev server:

    python manage.py runserver

