include ../ooz/config.make

dist_dir := dist
src_dir := src
demo_dir := demo

atlas_in_files := $(wildcard $(demo_dir)/*.aseprite)
asset_files := \
  $(demo_dir)/atlas.json \
  $(demo_dir)/atlas.png \
  $(demo_dir)/index.html
dist_files := $(asset_files:$(demo_dir)/%=$(dist_dir)/%)

bundle_args ?=
format_args ?=
test_unit_args ?=

.PHONY: build
build: bundle build-dist

.PHONY: build-dist
build-dist: $(dist_files)

.PHONY: watch-build
watch-build:; watchexec --ignore='*/$(dist_dir)/*' '$(make) build-dist'

.PHONY: watch
watch: watch-build watch-bundle serve

.PHONY: serve
serve: | $(dist_dir)/; $(live-server) '$(dist_dir)'

.PHONY: bundle
bundle: $(demo_dir)/atlas.json | $(dist_dir)/
  $(deno) bundle --config='$(deno_config)' mod.ts '$(dist_dir)/atlas-pack.js'
  $(deno) bundle --config='$(deno_config)' '$(demo_dir)/index.ts' '$(dist_dir)/index.js' $(bundle_args)

.PHONY: watch-bundle
watch-bundle: bundle_args += --watch
watch-bundle: bundle

.PHONY: test
test: test-format test-lint build test-unit

.PHONY: test-format
test-format: format_args += --check

.PHONY: format
format:; $(deno) fmt --config='$(deno_config)' $(format_args)

.PHONY: test-lint
test-lint:; $(deno) lint --config='$(deno_config)' $(if $(value v),,--quiet)

.PHONY: test-unit
test-unit: build; $(deno) test --allow-read=. --config='$(deno_config)' $(test_unit_args)

.PHONY: test-unit-update
test-unit-update: test_unit_args += --allow-write=. -- --update
test-unit-update: test-unit

$(dist_dir)/%: $(demo_dir)/% | $(dist_dir)/; $(cp) '$<' '$@'

$(demo_dir)/atlas.json $(demo_dir)/atlas.png&: $(atlas_in_files)
  bin/aseprite-batch \
    --merge-duplicates \
    --sheet '$(demo_dir)/atlas.png' \
    $^ \
    --color-mode=indexed|
  bin/atlas-pack > '$(demo_dir)/atlas.json'

$(dist_dir)/:; $(mkdir) '$@'

.PHONY: clean
clean:; $(rm) '$(dist_dir)/' '$(demo_dir)/atlas.json' '$(demo_dir)/atlas.png'
