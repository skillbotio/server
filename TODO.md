AlphaV1
- [X] Handle slots better on Alexa skills
- [X] Remote skill loader
- [X] Handle session ended repsonses and explicit session ends
- [X] add help command and default skill
- [X] switch skillbot server over to point at prod
- [X] add skillbot section to request payloads
- [X] save all interactions to dynamo? Or Mongo?
    - [X] add user type to payload
- [X] Deploy skillbot
- [X] create onboarding flow
    - [X] ask people for their location to get started
- [X] Save data from default skill to DB
- [X] Make skill configuration easy
    - [X] Automatically configure source
    - [X] Get image for skill to show - author_name, author_icon, author_link on slack
    - [X] Put AWS keys into environment variables
- [X] Add support for channel parameter
- [X] Add directions
    - [X] For configuring live skill
    - [X] for using custom bespoken properties
- [X] Add CI, code coverage and npm versions to all the repos
    - [X] client
    - [X] server
    - [X] slackbot
- [X] test conversation in general channel
- [X] Update skill info without restart
- [X] make sure location data is coming back
- [X] make sure onboarding works

AlphaV2
- [X] Remove houndify
- [X] Rename router, pull in message handler to it
- [X] Add directions
    - [ ] For configuring with Proxy
- [X] add snippets for json payloads - with debug command
- [X] clean up payloads
- [X] Add CI on default skill
- [X] try out thumb_url for the skill identification
- [X] update logo on installation screen for slack - no more silentecho
- [X] Update the favicon for skillbot server
- [X] when inviting to join a channel gives asks for onboarding info again
- [X] Add version command
- [X] Update URLs
- [X] Create landing page
- [X] support real skill ids
- [X] shared sessions for public channels? How to do this?
- [O] why is my literal slot value lowercase?
- [ ] Fix associate to create an array and pass user data (only to default)
- [ ] skill list should be invocation names
- [ ] support device location permission
- [ ] Do we really need to create a source for non-Lambda skillbots?
- [ ] enable logless on default skill
- [ ] automate deployment of default-skill
- [ ] Make ssml cleaner more robust - allow for escaping \> \<

AlphaV3
- [ ] Automatically toggle between spoke and proxy
- [ ] support for flash briefings
- [ ] public/private setting
- [ ] Add an FAQ
- [ ] add audioURL for ssml payload that concatnates voice and text using tts?
- [ ] How will default skill make data accessible?
- [ ] how to handle literals?
    - [ ] Add support for slot matching to virtual alexa
    - [ ] Better slot handling for builtin types - strings, numbers, country
- [ ] submit to slack
- [ ] remove punctuation from utterances
- [ ] Logo
- [ ] Make AWS credentials able to be set at profile level
- [ ] send multiple commands quickly
- [ ] Lambda security
    - [ ] Should we use cross-account access?
    - [ ] https://read.iopipe.com/public-cross-account-functions-on-aws-lambda-bcc148303083
    - [ ] Instructions on how to limit access to a particular lambda
    - [ ] lock down spokes

Beta
- [ ] Integration as command with bst ("botify?")
- [ ] Make enabling hound optional
- [ ] Make skill availability either public or private to use
- [ ] Landing page
- [ ] Figure out how to prevent people from stomping on each other's skills

V1
- [ ] Slack submission
- [ ] Twitter version

V2
- [ ] Echo show display and video skill
- [ ] Account linking API support
