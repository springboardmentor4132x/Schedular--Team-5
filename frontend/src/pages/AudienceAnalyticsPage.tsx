import {
  Users,
  UserPlus,
  UserMinus,
  TrendingUp,
  MapPin,
  Clock,
} from 'lucide-react';

export function AudienceAnalyticsPage() {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Audience Analytics
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Understand your audience growth, demographics, and activity
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Followers</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                83.6K
              </h2>
              <p className="text-xs text-emerald-600 mt-2">
                +15% vs last month
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">New Followers</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                4,820
              </h2>
              <p className="text-xs text-emerald-600 mt-2">
                +12% this month
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Lost Followers</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                1,240
              </h2>
              <p className="text-xs text-red-500 mt-2">
                -4% this month
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <UserMinus className="w-5 h-5 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Growth</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">
                +3,580
              </h2>
              <p className="text-xs text-emerald-600 mt-2">
                +8.4% growth
              </p>
            </div>

            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-violet-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Followers Growth */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">

        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Followers Growth
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Audience growth over the last 7 months
            </p>
          </div>

          <select className="text-xs border border-gray-200 rounded-lg px-3 py-2">
            <option>Last 7 months</option>
            <option>Last 30 days</option>
            <option>Last year</option>
          </select>
        </div>

        <div className="h-64 flex items-end gap-5 px-4">

          {[45, 52, 58, 61, 68, 76, 84].map((height, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end gap-2"
            >
              <div
                className="w-full max-w-12 bg-indigo-500 rounded-t-lg"
                style={{ height: `${height * 2.3}px` }}
              />

              <span className="text-xs text-gray-500">
                {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][index]}
              </span>
            </div>
          ))}

        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Age */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <h3 className="text-base font-semibold text-gray-900">
            Age Distribution
          </h3>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Audience age groups
          </p>

          <div className="space-y-4">

            {[
              ['18-24', 28],
              ['25-34', 36],
              ['35-44', 20],
              ['45-54', 10],
              ['55+', 6],
            ].map(([age, percentage]) => (

              <div key={age}>

                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{age}</span>
                  <span className="font-semibold text-gray-900">
                    {percentage}%
                  </span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

              </div>

            ))}

          </div>
        </div>

        {/* Gender */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <h3 className="text-base font-semibold text-gray-900">
            Gender Distribution
          </h3>

          <p className="text-sm text-gray-500 mt-1 mb-5">
            Audience by gender
          </p>

          <div className="space-y-4">

            {[
              ['Female', 52],
              ['Male', 44],
              ['Other', 4],
            ].map(([gender, percentage]) => (

              <div key={gender}>

                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{gender}</span>
                  <span className="font-semibold text-gray-900">
                    {percentage}%
                  </span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

              </div>

            ))}

          </div>
        </div>

      </div>

      {/* Location and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Locations */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-5 h-5 text-indigo-600" />

            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Top Audience Locations
              </h3>

              <p className="text-xs text-gray-500">
                Countries and cities
              </p>
            </div>
          </div>

          <div className="space-y-4">

            {[
              ['India', 'Hyderabad', '24%'],
              ['United States', 'New York', '18%'],
              ['United Kingdom', 'London', '12%'],
              ['Canada', 'Toronto', '9%'],
              ['Australia', 'Sydney', '7%'],
            ].map(([country, city, percentage]) => (

              <div
                key={country}
                className="flex items-center justify-between"
              >

                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {country}
                  </p>

                  <p className="text-xs text-gray-500">
                    {city}
                  </p>
                </div>

                <span className="text-sm font-semibold text-indigo-600">
                  {percentage}
                </span>

              </div>

            ))}

          </div>
        </div>

        {/* Active Hours */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">

          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-violet-600" />

            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Most Active Hours
              </h3>

              <p className="text-xs text-gray-500">
                When your audience is online
              </p>
            </div>
          </div>

          <div className="space-y-4">

            {[
              ['6 PM - 8 PM', 'High', '86%'],
              ['12 PM - 2 PM', 'Medium', '62%'],
              ['9 AM - 11 AM', 'Medium', '55%'],
              ['8 PM - 10 PM', 'High', '78%'],
            ].map(([time, level, percentage]) => (

              <div key={time}>

                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">
                    {time}
                  </span>

                  <span className="text-xs font-semibold text-gray-500">
                    {level}
                  </span>
                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: percentage }}
                  />
                </div>

              </div>

            ))}

          </div>
        </div>

      </div>

    </div>
  );
}