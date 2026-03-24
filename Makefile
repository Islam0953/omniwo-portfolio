.PHONY: test lint clean

test:
	bash test.sh

lint:
	@echo "No linter configured yet"

clean:
	find . -name "*.swp" -delete
	find . -name "*~" -delete
