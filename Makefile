all: crx3_pb.js

%_pb.js: %.proto
	node_modules/.bin/pbf $< > $@
