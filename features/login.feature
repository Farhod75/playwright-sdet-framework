Feature: Login

  Scenario: Standard user logs in successfully
    Given I am on the login page
    When I log in as the standard user
    Then I should see the products page

  Scenario: Locked out user cannot log in
    Given I am on the login page
    When I log in with username "locked_out_user" and password "secret_sauce"
    Then I should see an error containing "locked out"