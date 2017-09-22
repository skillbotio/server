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
    - [ ] Get image for skill to show - author_name, author_icon, author_link on slack
    - [ ] Put AWS keys into environment variables
- [ ] Add directions
    - [ ] For configuring live skill
    - [ ] for using custom bespoken properties
- [ ] Add CI, code coverage and npm versions to all the repos
- [ ] test conversation in general channel

AlphaV2
- [ ] Automatically toggle between spoke and proxy
- [ ] support device location permission
- [ ] Add directions
    - [ ] For configuring with Proxy
- [ ] Lambda security
    - [ ] Should we use cross-account access?
    - [ ] https://read.iopipe.com/public-cross-account-functions-on-aws-lambda-bcc148303083
    - [ ] Instructions on how to limit access to a particular lambda
    - [ ] lock down spokes
- [ ] clean up payloads
- [ ] Make ssml cleaner more robust - allow for escaping \> \<
- [X] Remove houndify
- [ ] Rename router, pull in message handler to it

AlphaV3
- [ ] support for flash briefings
- [ ] add audioURL for ssml payload that concatnates voice and text using tts?
- [ ] How will default skill make data accessible?
- [ ] how to handle literals?
    - [ ] Add support for slot matching to virtual alexa
    - [ ] Better slot handling for builtin types - strings, numbers, country
- [ ] submit to slack
- [ ] remove punctuation from utterances
- [ ] Logo
- [ ] Make AWS credentials able to be set at profile level

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
