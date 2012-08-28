describe('unit/css.parser.js', function() {
	var parser = require('../../src/css')
	  , fs = require('fs')
	  , fakes = sinon.scope()

	beforeEach(function() {
		fakes.fake(fs, 'readFileSync').callsFake(function(file) {
			return 'read ' + file
		})
	})
	afterEach(function() {
		fakes.restore()
	})

	describe('When parsing an import', function() {
		it('should take the current path into consideration', function() {
			fs.readFileSync.withArgs('a/b').returns('@import url(c);')
			parser.parse('a/b')
			expect(fs.readFileSync).to.have.been.calledWith('a/c')
		})
		it('should apply the path to any other urls as well', function() {
			fs.readFileSync.withArgs('a/b').returns('a{background: url(c);}')
			var result = parser.parse('a/b')
			expect(result).to.equal('a{background: url(a/c);}')
		})
	})
	describe('When parsing a file with different imports', function() {
		var result
		it('should work with strings with single quotes', function() {
			fs.readFileSync.withArgs('a.css').returns("@import 'file';")
			result = parser.parse('a.css')
			expect(result).to.equal('read file')
		})
		it('should work with strings with double quotes', function() {
			fs.readFileSync.withArgs('a.css').returns('@import "file";')
			result = parser.parse('a.css')
			expect(result).to.equal('read file')
		})
		it('should work with urls without quotes', function() {
			fs.readFileSync.withArgs('a.css').returns('@import url(file);')
			result = parser.parse('a.css')
			expect(result).to.equal('read file')
		})
		it('should work with urls with single quotes', function() {
			fs.readFileSync.withArgs('a.css').returns("@import url('file');")
			result = parser.parse('a.css')
			expect(result).to.equal('read file')
		})
		it('should work with urls with double quotes', function() {
			fs.readFileSync.withArgs('a.css').returns('@import url("file");')
			result = parser.parse('a.css')
			expect(result).to.equal('read file')
		})
	})
	describe('When calling parse() with a css file with no imports', function() {
		var result
		beforeEach(function() {
			fs.readFileSync.withArgs('a.css').returns('abc');
			result = parser.parse('a.css')
		})
		it('should ask the file-system for the file', function() {
			expect(fs.readFileSync).to.have.been.calledWith('a.css', 'utf8')
		})
		it('should return the file', function() {
			expect(result).to.equal('abc')
		})
	})
})
