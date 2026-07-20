ARG RUBY_VERSION=3

FROM ruby:${RUBY_VERSION}-alpine

RUN apk add --no-cache \
    build-base \
    git \
    tzdata \
    npm

WORKDIR /dist

COPY Gemfile .
RUN bundle install
RUN npm install -g pagefind

# Install the shacl-table generator's Node dependencies
COPY src/assets/js/shacl-table/package*.json /opt/shacl-table/
RUN npm ci --prefix /opt/shacl-table --no-audit --no-fund
ENV NODE_PATH=/opt/shacl-table/node_modules

EXPOSE 4000

CMD ["jekyll", "serve", "--host", "0.0.0.0", "--watch", "--incremental"]
