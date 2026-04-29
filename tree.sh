#!/bin/sh
# Prints project tree, skipping noise folders and files.
find . \
  -not -path '*/node_modules/*' \
  -not -path '*/.next/*' \
  -not -path '*/.git/*' \
  -not -path '*/vendor/*' \
  -not -name '*.sum' \
  | sort \
  | awk -F'/' '{ depth=NF-2; indent=""; for(i=0;i<depth;i++) indent=indent"  "; print indent $NF }'
