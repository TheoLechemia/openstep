# Openstep

Openstep is an opensource self-hosted travel book application.
It is a good opensource alternative of the wellknown PolarStep app.

Openstep is made of three main parts :
- a simple django-admin backoffice to create travels, steps, users and permissions
- a API provided by Django-Rest-Framework
- a angular frontend to display travels and step

## Functionality

With open step you can create several travels and write your trip adventures into steps. Each step can contain pictures, description and a location. All travel and steps are published in a public web app where everybody can read your adventures ! No need to be connected to access to the website and all the trips. Everyone can write comments on steps without being connected.
On the backoffice side, the admin can create severals users and attached them to travels. The users can only see and modify their own trips.




## Developpemnt

#### Frontend

Openstep frontend is a Angular app.
First install the app dependencies : 

    cd frontend/openstep
    npm install

Launch the dev server : 

    npm run start

#### Backend

The API and the backoffice are made with django.

Install backend dependencies: 

    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install requirements.in

Run dev server: 

    python manage.py runserver
    