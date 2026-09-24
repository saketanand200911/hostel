#include <iostream>
using namespace std;

int main()
{
    int n;
    cout << "enter any year: " << endl;
    cin >> n;
    if (n % 2000 != 0 && (n % 400 == 0 || (n % 4 == 0 && n % 100 != 0)))
    {
        cout << "leap year" << endl;
    }
    else
    {
        cout << "not a leap year";
    }

    return 0;
}