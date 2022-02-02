import { Blueprint, Schemas } from "optimal";
import { ContractMixin } from "../contract.mixin";

describe("ContractMixin", function() {
  class Base {

  }

  describe("blueprint has not been override", function() {

    it("should ignore options if blueprint has not been override", function() {
      class Greeter extends ContractMixin<{name: string}>(Base) {}
      const greeter = new Greeter({name: 'bar'});
      expect(greeter.options).toBeUndefined();
    });
  });

  describe("blueprint has been override", function() {
    class Greeter extends ContractMixin<{name: string}>(Base) {
      blueprint(schemas: Schemas, onConstruction?: boolean): Blueprint<object> | undefined {
        return {name: schemas.string().required()};
      }
    }

    it("should configure options", function() {
      const greeter = new Greeter({name: 'bar'});
      expect(greeter.options).toEqual({name: 'bar'})
    });

    it("should skip configure if no matched options", function() {
      const greeter = new Greeter('hello');
      expect(greeter.options).toBeUndefined();
    });

    it("should throw error if options is invalid", function() {
      expect(() => new Greeter({})).toThrow();
    });
  });
});
