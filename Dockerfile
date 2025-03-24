FROM node:10.15.1-alpine

# Create a new user
RUN addgroup -S appgroup && adduser -S appuser -G root

# Install Git
RUN apk update
RUN apk add git

# Add APPCENTER CLI
RUN npm install -g appcenter-cli

# Add Tiny
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
# ENTRYPOINT ["/tini", "--"]

WORKDIR /usr/src/app

# User setup
RUN chmod g+rwx .
USER appuser
ENV APPCENTER_TOKEN token
ENV APP GrooveAppTeser
ENV DEPLOYMENT Staging
ENV DISTRIBUTION_RATE 100

# project specific
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
COPY ["scripts/", "./scripts"] 
RUN npm i
COPY . .
# EXPOSE 8081
CMD ["sh", "-c", "appcenter login --token $APPCENTER_TOKEN --disable-telemetry && appcenter codepush release-react -a $APP -d $DEPLOYMENT -r $DISTRIBUTION_RATE -k private.pem"]