About
===============
This is a playground to learn ReactJS, NextJS, and various frontend and backend services required for developing a CMS web framework from scratch. This site is viewable live at https://dev.mikesshop.net and automatically rebuilds and relaunches with each commit.

Technologies
==============
* ReactJS/NextJS
  * Frontend and SSR
* Docker/docker-compose
  * Duild and deploy environments
* nginx
  * Routing between frontend and backend
* PostgreSQL
  * Database integration with backend
* Expresso
  * Static content and routing
* Python Flask/SqlAlchemy
  * Backend
* Modular plugin based architecture, providing:
  * Grouping of ReactJS components and Javascript API alongside Python backend endpoints
  * Automatic loading of detected modules with Flask Blueprints
* CDN
  * Built-in flask based cdn endpoints

Architecture
===============

* Docker containers
  * nginx
    * Contains routes for frontend and backend
  * Frontend
    * ReactJS/NextJS
    * Runs Expresso server providing NextJS static and dynamic content
  * Backend
    * Python/Flask/Sqlalchemy
    * Authentication
      * Flask API backed user authentication
      * JWT with cookie integration providing both XSS and CSRF protection
      * User profiles with extra information available via API endpoint
    * Modules
      * Forums
        * Generic Forums module, allowing markdown based post formatting
        * Posts require authentication and are tied to a user
      * Blog
        * Markdown based blogging module
        * Image Upload, with automatic thumbnail eneration and Lightbox for user presentation
        * Links to authentication module

How to run
===============
Clone the repository
> $ git clone https://github.com/malcom2073/mikesshop.net
>
> $ cd mikesshop.net

Build docker containers. docker-compose.dev.yaml is for local development use

> $ cd docker
> 
> $ docker-compose -f docker-compose.dev.yaml build

Launch docker service.

> $ docker-compose -f docker-compose.dev.yaml up

You can now browse to http://localhost:80 to view the site! In production, I terminate SSL at the load balancer, and forward unencrypted traffic through my internal network to the nginx instance, which is why the development setup runs with no certificates.
