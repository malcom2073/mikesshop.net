import json
from flask import Flask, jsonify, request
import datetime
import jwt
import pprint
import hashlib
import random
import csv
import string
from . import config
from . import db
app = Flask(__name__)

# Obv this will need to be changed for production.
app.config['SECRET_KEY'] = config.SECRET_KEY

main_table_list = {}

def encode_auth_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=0, seconds=300),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(
        payload,
        app.config.get('SECRET_KEY'),
        algorithm='HS256'
    )

from app.models import user as User
from app.models import group as Group
from app.models import userprofilefield as UserProfileField


try:
    db.Model.metadata.create_all(db.engine)
    db.session.commit()
except:
    print("Failed to create")
    db.session.rollback()
    pass
try:
    db.session.add(Group.Group(id=1,name="Members",parent=4))
    db.session.add(Group.Group(id=2,name="Admin",parent=3))
    db.session.add(Group.Group(id=3,name="Moderator",parent=12))
    db.session.add(Group.Group(id=4,name="Unconfirmed Member"))
    db.session.add(Group.Group(id=5,name="Member-I",parent=1))
    db.session.add(Group.Group(id=6,name="Member-II",parent=5))
    db.session.add(Group.Group(id=7,name="Member-III",parent=6))
    db.session.add(Group.Group(id=8,name="Member-IV",parent=7))
    db.session.add(Group.Group(id=9,name="Member-V",parent=8))
    db.session.add(Group.Group(id=10,name="Member-VI",parent=9))
    db.session.add(Group.Group(id=11,name="Member-VII",parent=10))
    db.session.add(Group.Group(id=12,name="Donator",parent=11))  
    db.session.commit()
except Exception as e:
    pprint.pprint(e)
    print("Failed to load groups")
    db.session.rollback()
    
try:
    print("Trying to load test user")
    with open('output.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                line_count += 1
            else:
                db.session.add(User.User(id=row[0],name=row[1],password=row[3],email=row[9],timezone='edt',lastip=row[11],nickname=row[2],primary_group_id=row[7],registered_date=datetime.datetime.now()))
                line_count += 1
        print(f'Processed {line_count} lines.')
    db.session.commit()
except:
    print("Failed to load test user")
    db.session.rollback()
    pass
print("Done loading")

def decode_auth_token(auth_token):
    payload = jwt.decode(auth_token, app.config.get('SECRET_KEY'))
    return payload['sub']

# Pulls the auth token out of a request if it exists in the Authorization header
def getAuthToken(request):
    auth_header = request.headers.get('Authorization')
    auth_token = ''
    if auth_header:
        try:
            auth_token = auth_header.split(" ")[1]
            return auth_token
        except:
            pass
    return None

def getJwt(request):
    auth_token = getAuthToken(request)
    pprint.pprint(auth_token)
    if auth_token:
        try:
            resp = decode_auth_token(auth_token)
            pprint.pprint(resp)
            print("Cookies")
            pprint.pprint(request.cookies)
            if resp:
                if 'mspysid' in request.cookies:
                    session = request.cookies['mspysid']
                    m = hashlib.sha256()
                    if session is not None:
                        m.update(session.encode('utf-8'))
                        if m.hexdigest() != resp['session']:
                            print('Invalid hex')
                            return None
                    else:
                        print('No session var')
                        return None
                    return resp
        except:
            print('Exception')
            return None
    return None


# Wrapper function for needing jwt
# This checks the JWT expiration, as well as making sure that there is a 
# cookie (should check httponly and secure) matching the sha256 of the session ID
# Is this a good way to prevent XSS? Someone would have to hijack both the JWT, as well
# as the session cookie, which if the latter is stored in httponly, that should be impossible?
# We should invalidate tokens used with either no session, or an invalid session as an
# additional security measure.
 
def jwt_private(func):
    def wrapper_jwt_private(*args, **kwargs):
        print('Path:')
        pprint.pprint(request.path)
        auth_token = getAuthToken(request)
        jwt = getJwt(request)
        if jwt is None:
            return jsonify({'status':'error','error':'Null session'}),401
        pprint.pprint(jwt)
        if request.path in role_routes:
            if 'role_required' in role_routes[request.path]:
                minrole = role_routes[request.path]['role_required']
                foundrole = False
                for role in jwt['roles']:
                    if checkRole(role,minrole):
                        foundrole = True
                        break
                if foundrole:
                    return func(*args, **kwargs)
                else:
                    return jsonify({'status':'error','error':'Invalid permissions'}),401
        else:
            return func(*args,**kwargs)
    wrapper_jwt_private.__name__ = func.__name__
    return wrapper_jwt_private
    

def checkRole(role,roletocheck):
    if role == roletocheck:
        return True
    if role in roles:
        if 'parent' in roles[role]:
            return checkRole(roles[role]['parent'],roletocheck)
    return False
roles = {
    'admin' : {
        'parent':'member3'
    },
    'member3' : {
        'parent':'member2'
    },
    'member' : {
        'parent':'guest'
    },
    'member2' : {
        'parent':'member'
    },
    'guest' : {

    }
}
role_routes = {
    '/auth' : {
        'role_required': None
    },
    '/private' : {
        'role_required':'member'
    }
}

# Be sure to return 4, I rolled 3d8 to get that.
def get_random_string(length):
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(length))
    print("Random string of length", length, "is:", result_str)
    return result_str


# Post to here to authenticate, get your httponly cookie, and get your jwt matching it.
# Any credentials work.
# TODO: Add a database backend to this for credential, role, etc storage.
# Do we need a separate jwt for role storage? Should the auth cookie be purely for auth?
# Cookies have size limitations to them...
@app.route('/auth', methods=['POST'])
def auth():
    post_data = request.get_json()
    print('User: ' + post_data.get('username'))
    print('Pass: ' + post_data.get('password'))
    dbsession = db.Session()
    user = dbsession.query(User.User).filter(User.User.name == post_data.get('username')).first()
    pprint.pprint(user)
    dbsession.close()
    if user is None:
        print("No user")
        return jsonify({'status':'failure','error':'invalid credentials'}),401
    if user is None or not user.check_password(post_data.get('password')):
        print("Invalid user/pass")
        return jsonify({'status':'failure','error':'invalid credentials'}),401
    print("GTG!")
    #if not (post_data.get('username') == 'mike' and post_data.get('password') == 'asdfasdf'):
    #    return jsonify({'status':'failure','error':'invalid credentials'}),401

    session = request.cookies.get('session')
    m = hashlib.sha256()
    if session is None:
        session = get_random_string(24)
    m.update(session.encode('utf-8'))
    roleobj = {
        'user': post_data.get('username'),
        'roles': [
            'admin',
            'member-i',
            'member-iv'
        ],
        'session': m.hexdigest()
    }
    resp = jsonify({'status':'success','access_token':encode_auth_token(roleobj).decode('utf-8')})
    resp.set_cookie("mspysid", value = session, httponly = True)
    return resp

# Log out, this clears out the session cookie so future requests fail. 
# TODO: Also invalidate the jwt and keep it in the invalidation store until expiration.
@app.route('/logout',methods=['POST'])
@jwt_private
def logout():
    print('LOGGING OUT*****************')
    resp = jsonify({'status':'success'})
    resp.set_cookie('mspysid', '', expires=0)
    return resp

@app.route('/private')
@jwt_private
def private():
    #post_data = request.get_json()
    #pprint.pprint(resp)
    return 'Private data!\n'

@app.route('/')
def index():
    return jsonify({'name': 'alice',
                    'email': 'alice@outlook.com'})


@app.route('/getAllPostIds')
def getAllPostIds():
    return jsonify([
        {
            'params': {
                'ids': 'ssg-ssr'
            }
        },
#        {
#            'params' : {
#                'ids': 'pre-rendering'
#            }
#        }
    ])

    
@app.route('/getNavbar')
def getNavbar():
    print("test2")
    menuleftlist = [
        {
            'title':  'Home',
            'link': '/',
            'type':'link'
        },
        {
            'title':  'Forum',
            'link': '/forum',
            'type':'link'
        },
        {
            'title':  'Status',
            'link': '/status',
            'type':'link'
        },
        {
            'title':  'Private',
            'link': '/private',
            'type':'link'
        },
    ]
    print("test")
    jwt = getJwt(request)
    print('jwt')
    pprint.pprint(jwt)
    print('Donejwt')
    if jwt is not None:
        menurightlist = [
        {
                'title':  jwt['user'],
                'type':'dropdown',
                'links': [
                    {
                        'title': 'Profile',
                        'type':'link',
                        'link' : '/profile'
                    },
                    {
                        'title': 'Logout',
                        'type':'link',
                        'link' : '/logout'
                    },
                    {
                        'title': '',
                        'type':'divider'
                    },
                    {
                        'title': 'Sign-Up',
                        'type':'link',
                        'link' : '/signup'
                    }
                ]
            },
        ]
    else:
        menurightlist = [
        {
                'title':  'Guest',
                'type':'dropdown',
                'links': [
                    {
                        'title': 'Login',
                        'type':'link',
                        'link' : '/login'
                    },
                    {
                        'title': '',
                        'type':'divider'
                    },
                    {
                        'title': 'Sign-Up',
                        'type':'link',
                        'link' : '/signup'
                    }
                ]
            },
        ]
    return jsonify({'menuleft' : menuleftlist,'menuright' : menurightlist})

app.run()

