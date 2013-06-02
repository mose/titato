def play(grid, i, x)
  g = (i/3).floor
  if g == 0
    grid[i][x] = 'x'
  elsif g == 1
    grid[x][i-3] = 'x'
  else
    a, b = [["00", "11", "22"], ["02", "11", "20"]][i - 6][x].split('').map(&:to_i)
    grid[a][b] = 'x'
  end
  return grid
end

grid = []

while (input=gets) do
  break if input.strip == ""
  grid << input.strip.split(/\|/).map { |c| c == '_' ? false : c }
end

# puts grid.inspect
# grid = [['o',false,false],[false,'x',false],['x',false,'o']]

diagonal = [ [ grid[0][0], grid[1][1], grid[2][2] ], [ grid[0][2], grid[1][1], grid[2][0] ] ]
fullgrid = grid + grid.transpose + diagonal
slots = fullgrid.map { |i| i.map { |i| i || '' }.join() }

if slots.include? 'xx'
  row = slots.index 'xx'
  cell = fullgrid[row].index false
elsif slots.include? 'oo'
  row = slots.index 'oo'
  cell = fullgrid[row].index false
elsif slots.include? 'o'
  if grid[1][1] == false
    row = 1
    cell = 1
  else
    row = slots.index 'o'
    cell = fullgrid[row].index false
  end
else
  row = 1
  cell = 1
end

grid = play(grid, row, cell)

grid.each do |r|
  puts r.map { |c| c || '_' }.join('|')
end


