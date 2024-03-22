import { calcOverallRating } from "../../src/utils/mapper";

describe("calculate overall ratings", () => {
	describe("ratings [2,3,5,4]", () => {
		it("should return 3.5 as overall course rating", () => {
			const reviews: { rating: number }[] = [
				{
					rating: 2
				},
				{
					rating: 3
				},
				{
					rating: 5
				},
				{
					rating: 4
				}
			];

			const overallRatings = calcOverallRating(reviews);

			expect(overallRatings).toEqual(3.5);
		});
	});

	describe("ratings [0,0]", () => {
		it("should return 0 as overall rating", () => {
			const reviews: { rating: number }[] = [{ rating: 0 }, { rating: 0 }];

			const overallRatings = calcOverallRating(reviews);

			expect(overallRatings).toEqual(0);
		});
	});

	describe("ratings []", () => {
		it("should return 0 as overall rating", () => {
			const overallRatings = calcOverallRating([]);

			expect(overallRatings).toEqual(0);
		});
	});
});
