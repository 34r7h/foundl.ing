# Foundling Testing System

This directory contains the centralized testing infrastructure for the Foundling project. The system automatically analyzes your codebase to generate comprehensive test specifications and ensure 100% test coverage accuracy.

## 🎯 **Purpose**

The Foundling Testing System is designed to:

- **Automate Test Discovery**: Automatically find all functions in your codebase
- **Ensure Coverage Accuracy**: Generate test specifications for every function
- **Maintain Test Quality**: Track function changes and update tests accordingly
- **Support CI/CD**: Provide structured data for automated test generation
- **Reduce Manual Work**: Eliminate the need to manually identify what needs testing

## 🔧 **How It Works**

### **1. Codebase Analysis**
The `unit_setup.ts` script performs comprehensive analysis:

- **Scans Directories**: `client/`, `server/`, `contracts/`
- **Parses Functions**: Detects multiple function patterns and signatures
- **Extracts Types**: Captures parameter types, return types, and function signatures
- **Generates Hashes**: Creates unique identifiers for change detection

### **2. Function Detection Patterns**
Supports all common JavaScript/TypeScript function patterns:

```typescript
// Function declarations
function name(params): returnType { ... }

// Arrow functions
const name = (params): returnType => { ... }

// Method definitions
name(params): returnType { ... }

// Async functions
async function name(params): returnType { ... }

// Class methods
public/private/protected name(params): returnType { ... }

// Object methods
name: function(params): returnType { ... }
name: (params): returnType => { ... }

// Export functions
export function name(params): returnType { ... }
export const name = (params): returnType => { ... }
```

### **3. Smart Type Inference**
When return types are missing or `any`, the system infers them based on:

- **Function Context**: File path, parameter names, function behavior
- **Naming Patterns**: `get*` → `Promise<any>`, `set*` → `boolean`, etc.
- **Parameter Types**: Input types often indicate output types
- **Function Purpose**: Server functions → `void`, math functions → `number`

### **4. Test Data Generation**
Creates realistic test specifications:

- **Test Arguments**: Appropriate input values for each parameter type
- **Expected Results**: Realistic output values based on return types
- **Testable Properties**: Identifies what aspects can be tested
- **Change Detection**: Tracks function modifications for test updates

## 📁 **File Structure**

```
tests/
├── README.md              # This documentation
├── unit_setup.ts          # Main function parser and wizard
├── unit_tests.json        # Generated function tree and test specs
├── package.json           # Dependencies and scripts
└── node_modules/          # Installed packages
```

## 🚀 **Usage**

### **Running the Setup Script**

```bash
# Navigate to tests directory
cd tests

# Run the comprehensive analysis
bun unit_setup.ts

# Or use the npm script (if configured)
bun run setup
```

### **What Happens During Execution**

1. **Codebase Scan**: Parses all supported directories and files
2. **Function Extraction**: Identifies and analyzes all functions
3. **Type Inference**: Determines missing return types and properties
4. **Interactive Wizard**: Prompts for test data input (if needed)
5. **JSON Generation**: Creates comprehensive test specifications
6. **Summary Report**: Shows detected functions and their properties

### **Output Example**

```json
{
  "server/math.ts": {
    "multiply": {
      "arguments": { "x": "number", "y": "number" },
      "return": "number",
      "test": { "x": 2, "y": 3 },
      "result": 6,
      "hash": "4bd0117a",
      "testableProperties": ["range", "precision", "edge_cases"]
    }
  }
}
```

## 🔍 **Understanding the Output**

### **Function Information**
- **`arguments`**: Parameter names and their TypeScript types
- **`return`**: Function return type (parsed or inferred)
- **`test`**: Test input values for each parameter
- **`result`**: Expected output value for the function
- **`hash`**: Unique identifier for change detection
- **`testableProperties`**: Aspects that can be tested

### **Testable Properties by Return Type**
- **`void`**: `side_effects`, `state_changes`, `external_calls`
- **`boolean`**: `truthiness`, `edge_cases`
- **`number`**: `range`, `precision`, `edge_cases`
- **`string`**: `length`, `format`, `content`
- **`Promise<any>`**: `async_behavior`, `timeout`, `error_handling`

## 🧪 **Next Steps for Test Generation**

### **Phase 1: Test Framework Setup**
- [ ] Install testing framework (Jest, Vitest, or similar)
- [ ] Configure test environment for client, server, and contracts
- [ ] Set up test runners and coverage reporting

### **Phase 2: Test Generation Engine**
- [ ] Create test template generator using `unit_tests.json`
- [ ] Implement automatic test file creation
- [ ] Generate test cases for each function
- **Example Output**:
  ```typescript
  describe('multiply', () => {
    it('should multiply two numbers correctly', () => {
      const result = multiply(2, 3);
      expect(result).toBe(6);
    });
  });
  ```

### **Phase 3: Test Execution and Validation**
- [ ] Run generated tests against actual code
- [ ] Validate test coverage and accuracy
- [ ] Implement test result reporting
- [ ] Set up CI/CD integration

### **Phase 4: Advanced Features**
- [ ] Mock generation for external dependencies
- [ ] Edge case test generation
- [ ] Performance testing integration
- [ ] Contract testing for blockchain functions

## 🚨 **Current Limitations**

### **Known Issues**
1. **Complex Function Parsing**: Some advanced TypeScript patterns may not parse correctly
2. **Return Type Inference**: Limited to basic patterns and naming conventions
3. **Test Data Generation**: Requires manual input for complex types
4. **Function Execution Analysis**: No runtime analysis of function behavior

### **Areas for Improvement**
- Better handling of generic types and complex unions
- Improved regex patterns for edge cases
- Runtime function analysis for better type inference
- Integration with TypeScript compiler API

## 🔄 **Maintenance and Updates**

### **When to Re-run the Script**
- **New Functions Added**: Run to discover new functions
- **Function Signatures Changed**: Run to update test specifications
- **Return Types Modified**: Run to update expected results
- **Before CI/CD**: Ensure test coverage is current

### **Change Detection**
The system automatically detects function changes using hash-based comparison:
- **Hash Mismatch**: Function has changed, requires test updates
- **New Function**: No existing hash, needs new test specification
- **Removed Function**: Automatically cleaned up from test tree

## 📚 **Integration with Development Workflow**

### **Development Process**
1. **Write Code**: Create functions with proper TypeScript types
2. **Run Setup**: Execute `unit_setup.ts` to analyze changes
3. **Review Output**: Check generated test specifications
4. **Generate Tests**: Use specifications to create actual test files
5. **Run Tests**: Execute tests and validate coverage

### **CI/CD Integration**
- **Pre-commit**: Run setup script to ensure test coverage
- **Build Pipeline**: Generate tests from specifications
- **Test Execution**: Run generated tests automatically
- **Coverage Reporting**: Track test coverage metrics

## 🤝 **Contributing**

### **Improving the Parser**
- Add new function pattern regexes
- Enhance type inference logic
- Improve test data generation
- Add support for new file types

### **Extending Test Generation**
- Create new test templates
- Add framework-specific generators
- Implement advanced test scenarios
- Support for contract testing

---

## 📋 **TODO**

### **High Priority**
- [ ] **Fix Complex Function Parsing**: Improve regex patterns for advanced TypeScript syntax
- [ ] **Enhance Return Type Inference**: Better context analysis and pattern matching
- [ ] **Add TypeScript Compiler API**: Use official parser for more accurate type extraction
- [ ] **Implement Test Generator**: Create actual test files from specifications
- [ ] **Add Mock Generation**: Automatically generate mocks for external dependencies

### **Medium Priority**
- [ ] **Runtime Function Analysis**: Execute functions to understand behavior
- [ ] **Edge Case Detection**: Identify boundary conditions and error scenarios
- [ ] **Performance Testing**: Add performance benchmarks to test specifications
- [ ] **Contract Testing**: Special handling for Solidity smart contracts
- [ ] **Vue Component Testing**: Parse Vue SFC files and component methods

### **Low Priority**
- [ ] **Test Template Customization**: Allow developers to customize test generation
- [ ] **Multi-language Support**: Extend beyond TypeScript/JavaScript
- [ ] **Visual Test Dashboard**: Web interface for test management
- [ ] **Test History Tracking**: Version control for test specifications
- [ ] **Integration Testing**: Support for integration test generation

### **Bug Fixes**
- [ ] **Fix serve function parsing**: The Bun serve function is not parsing correctly
- [ ] **Improve error handling**: Better error messages for parsing failures
- [ ] **Handle circular dependencies**: Prevent infinite loops in complex imports
- [ ] **Fix type conversion**: Better handling of complex TypeScript types

### **Documentation**
- [ ] **API Documentation**: Document all public methods and interfaces
- [ ] **Examples**: Add more comprehensive usage examples
- [ ] **Troubleshooting Guide**: Common issues and solutions
- [ ] **Video Tutorials**: Screen recordings of the system in action

---

*Last Updated: August 11, 2025*
*Version: 1.0.0*


