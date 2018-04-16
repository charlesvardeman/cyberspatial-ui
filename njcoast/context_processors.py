import os 

def export_vars(request):
    data = {}
    data['SIMULATION_BUCKET'] = os.getenv('SIMULATION_BUCKET', 'https://s3.amazonaws.com/simulation.njcoast.us')
    data['USER_SIMULATION_BUCKET'] = os.getenv('USER_SIMULATION_BUCKET', 'simulation')
    return data
